using JoaoDeBarro.Receivables.Api.Configuration;
using JoaoDeBarro.Receivables.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ReceivableContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(typeof(JoaoDeBarro.Receivables.Application.AutoMapper.ReceivablesMappingProfile).Assembly);
builder.Services.AddMediatR(typeof(JoaoDeBarro.Receivables.Domain.Events.UpdateReceivablesEvent).Assembly);

builder.Services.RegisterServices();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

using FluentValidation;
using FluentValidation.AspNetCore;
using JoaoDeBarro.BuildingBlocks.MediatR;
using JoaoDeBarro.Payables.Domain;
using JoaoDeBarro.Payables.Infrastructure;
using JoaoDeBarro.Payables.Infrastructure.Repositories;
using JoaoDeBarro.Payables.Application.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PayableContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddMediatR(typeof(PayableCommandHandler).Assembly);
builder.Services.AddScoped<IMediatrHandler, MediatrHandler>();
builder.Services.AddScoped<IPayableRepository, PayableRepository>();
builder.Services.AddScoped<PayableContext>();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssembly(typeof(AddPayableValidation).Assembly);
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:14200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendDev");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

app.Run();

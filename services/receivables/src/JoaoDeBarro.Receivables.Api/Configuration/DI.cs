using JoaoDeBarro.BuildingBlocks.MediatR;
using JoaoDeBarro.Receivables.Application.Interfaces;
using JoaoDeBarro.Receivables.Application.Services;
using JoaoDeBarro.Receivables.Domain.Interfaces;
using JoaoDeBarro.Receivables.Infrastructure;
using JoaoDeBarro.Receivables.Infrastructure.Repositories;
using MediatR;

namespace JoaoDeBarro.Receivables.Api.Configuration;

public static class DI
{
    public static void RegisterServices(this IServiceCollection services)
    {
        //Bus
        services.AddScoped<IMediatrHandler, MediatrHandler>();
        
        //Receivables
        services.AddScoped<IReceivableRepository, ReceivableRepository>();
        services.AddScoped<IReceivableAppService, ReceivableAppService>();
        services.AddScoped<ReceivableContext>();

    }
}
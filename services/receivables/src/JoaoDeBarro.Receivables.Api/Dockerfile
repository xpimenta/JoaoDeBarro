FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["services/receivables/src/JoaoDeBarro.Receivables.Api/JoaoDeBarro.Receivables.Api.csproj", "services/receivables/src/JoaoDeBarro.Receivables.Api/"]
COPY ["services/receivables/src/JoaoDeBarro.Receivables.Application/JoaoDeBarro.Receivables.Application.csproj", "services/receivables/src/JoaoDeBarro.Receivables.Application/"]
COPY ["services/receivables/src/JoaoDeBarro.Receivables.Infrastructure/JoaoDeBarro.Receivables.Infrastructure.csproj", "services/receivables/src/JoaoDeBarro.Receivables.Infrastructure/"]
COPY ["services/receivables/src/JoaoDeBarro.Receivables.Domain/JoaoDeBarro.Receivables.Domain.csproj", "services/receivables/src/JoaoDeBarro.Receivables.Domain/"]
COPY ["shared/BuildingBlocks/src/JoaoDeBarro.BuildingBlocks/JoaoDeBarro.BuildingBlocks.csproj", "shared/BuildingBlocks/src/JoaoDeBarro.BuildingBlocks/"]
COPY ["shared/SharedKernel/src/JoaoDeBarro.SharedKernel/JoaoDeBarro.SharedKernel.csproj", "shared/SharedKernel/src/JoaoDeBarro.SharedKernel/"]

RUN dotnet restore "services/receivables/src/JoaoDeBarro.Receivables.Api/JoaoDeBarro.Receivables.Api.csproj"

COPY . .

WORKDIR "/src/services/receivables/src/JoaoDeBarro.Receivables.Api"
RUN dotnet publish "JoaoDeBarro.Receivables.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "JoaoDeBarro.Receivables.Api.dll"]


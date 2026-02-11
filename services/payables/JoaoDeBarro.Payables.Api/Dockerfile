FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["services/payables/JoaoDeBarro.Payables.Api/JoaoDeBarro.Payables.Api.csproj", "services/payables/JoaoDeBarro.Payables.Api/"]
COPY ["services/payables/src/JoaoDeBarro.Payables.Application/JoaoDeBarro.Payables.Application.csproj", "services/payables/src/JoaoDeBarro.Payables.Application/"]
COPY ["services/payables/src/JoaoDeBarro.Payables.Infrastructure/JoaoDeBarro.Payables.Infrastructure.csproj", "services/payables/src/JoaoDeBarro.Payables.Infrastructure/"]
COPY ["services/payables/src/JoaoDeBarro.Payables.Domain/JoaoDeBarro.Payables.Domain.csproj", "services/payables/src/JoaoDeBarro.Payables.Domain/"]
COPY ["shared/BuildingBlocks/src/JoaoDeBarro.BuildingBlocks/JoaoDeBarro.BuildingBlocks.csproj", "shared/BuildingBlocks/src/JoaoDeBarro.BuildingBlocks/"]
COPY ["shared/SharedKernel/src/JoaoDeBarro.SharedKernel/JoaoDeBarro.SharedKernel.csproj", "shared/SharedKernel/src/JoaoDeBarro.SharedKernel/"]

RUN dotnet restore "services/payables/JoaoDeBarro.Payables.Api/JoaoDeBarro.Payables.Api.csproj"

COPY . .

WORKDIR "/src/services/payables/JoaoDeBarro.Payables.Api"
RUN dotnet publish "JoaoDeBarro.Payables.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "JoaoDeBarro.Payables.Api.dll"]


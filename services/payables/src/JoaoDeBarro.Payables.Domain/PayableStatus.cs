namespace JoaoDeBarroPayables.Domain;

/// <summary>
/// Payable Status (Status da Conta a Pagar)
/// </summary>
public enum PayableStatus
{
    Open = 1,     // Em aberto / No prazo
    DueToday = 2, // Vence hoje
    Overdue = 3,  // Em atraso
    Settled = 4   // Quitado / Liquidado
}
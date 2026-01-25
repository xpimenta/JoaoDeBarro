namespace JoaoDeBarro.Receivables.Domain;

/// <summary>
/// Receivable Status (Status da Conta a Receber)
/// </summary>
public enum ReceivableStatus
{
    Open = 1,     // Em aberto / No prazo
    DueToday = 2, // Vence hoje
    Overdue = 3,  // Em atraso
    Settled = 4   // Quitado / Liquidado
}
using AutoMapper;
using JoaoDeBarro.Receivables.Application.DTOs;
using JoaoDeBarro.Receivables.Application.Interfaces;
using JoaoDeBarro.Receivables.Domain;
using JoaoDeBarro.Receivables.Domain.Interfaces;

namespace JoaoDeBarro.Receivables.Application.Services;

public class ReceivableAppService : IReceivableAppService
{
    private readonly IReceivableRepository _receivableRepository;
    private readonly IMapper _mapper;
    
    public ReceivableAppService(IReceivableRepository receivableRepository, IMapper mapper)
    {
        _receivableRepository = receivableRepository;
        _mapper = mapper;
    }
    
    
    public async Task<ReceivableDto?> GetReceivableAsync(Guid receivableId)
    {
        return _mapper.Map<ReceivableDto>(await _receivableRepository.GetReceivableAsync(receivableId));
    }

    public async Task<IEnumerable<ReceivableDto>> GetReceivablesAsync()
    {
        return _mapper.Map<IEnumerable<ReceivableDto>>(await _receivableRepository.GetReceivablesAsync());
    }

    public async Task<Guid> AddReceivable(ReceivableDto receivableDto)
    {
        var receivable = _mapper.Map<Receivable>(receivableDto);
        _receivableRepository.AddReceivable(receivable);
        await _receivableRepository.UnitOfWork.CommitAsync();
        return receivable.Id;
    }

    public async Task UpdateReceivable(ReceivableDto receivableDto)
    {
        var receivable = _mapper.Map<Receivable>(receivableDto);
        _receivableRepository.UpdateReceivable(receivable);
        await _receivableRepository.UnitOfWork.CommitAsync();
    }
}

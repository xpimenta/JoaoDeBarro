using JoaoDeBarro.Receivables.Application.DTOs;
using JoaoDeBarro.Receivables.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JoaoDeBarro.Receivables.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceivablesController : ControllerBase
{
    private readonly IReceivableAppService _service;

    public ReceivablesController(IReceivableAppService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReceivableDto>>> GetAll()
    {
        var result = await _service.GetReceivablesAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReceivableDto>> GetById(Guid id)
    {
        var result = await _service.GetReceivableAsync(id);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReceivableDto? dto)
    {
        if (dto is null)
            return BadRequest("Payload inválido.");

        var id = await _service.AddReceivable(dto);
        return CreatedAtAction(nameof(GetById), new { id }, dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ReceivableDto? dto)
    {
        if (dto is null)
            return BadRequest("Payload inválido.");

        if (dto.Id.HasValue && dto.Id.Value != Guid.Empty && dto.Id.Value != id)
            return BadRequest("Route id does not match payload id.");

        dto.Id = id;
        await _service.UpdateReceivable(dto);
        return NoContent();
    }
}

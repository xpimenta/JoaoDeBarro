using JoaoDeBarro.BuildingBlocks.MediatR;
using JoaoDeBarro.Payables.Application.Commands;
using Microsoft.AspNetCore.Mvc;

namespace JoaoDeBarro.Payables.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PayablesController : ControllerBase
{
    private readonly IMediatrHandler _mediator;

    public PayablesController(IMediatrHandler mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddPayableCommand? command)
    {
        if (command is null)
            return BadRequest("Payload inválido.");

        var result = await _mediator.SendCommand(command);
        if (!result)
            return BadRequest("Falha ao processar o comando.");

        return Accepted();
    }
    
}

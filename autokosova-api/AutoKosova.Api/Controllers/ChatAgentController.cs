using AutoKosova.Business.DTOs.Chat;
using AutoKosova.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoKosova.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatAgentController : BaseApiController
    {
        private readonly IChatAgentService _chatAgentService;

        public ChatAgentController(IChatAgentService chatAgentService)
        {
            _chatAgentService = chatAgentService;
        }

        /// <summary>
        /// Send a conversation to the AutoKosova OpenAI assistant.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("message")]
        public async Task<IActionResult> SendMessage(
            [FromBody] ChatAgentRequestDto request,
            CancellationToken cancellationToken)
        {
            var result = await _chatAgentService.SendMessageAsync(request, cancellationToken);
            return ToActionResult(result);
        }
    }
}

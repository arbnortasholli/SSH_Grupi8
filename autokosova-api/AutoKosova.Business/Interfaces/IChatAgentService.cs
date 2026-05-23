using AutoKosova.Business.DTOs.Chat;
using AutoKosova.Business.Services;

namespace AutoKosova.Business.Interfaces
{
    public interface IChatAgentService
    {
        Task<ServiceResult<ChatAgentResponseDto>> SendMessageAsync(ChatAgentRequestDto request, CancellationToken cancellationToken = default);
    }
}

namespace AutoKosova.Business.DTOs.Chat
{
    public class ChatAgentResponseDto
    {
        public required string Reply { get; set; }
        public string? Model { get; set; }
    }
}

using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

namespace AutoKosova.Business.Services
{
    public class RedisConnectionProvider
    {
        public RedisConnectionProvider(IConfiguration configuration)
        {
            var redisConnectionString = configuration["Redis:ConnectionString"] ?? "localhost:6379";
            var redisConfiguration = ConfigurationOptions.Parse(redisConnectionString);
            redisConfiguration.AbortOnConnectFail = false;
            redisConfiguration.ConnectTimeout = 1000;

            try
            {
                Connection = ConnectionMultiplexer.Connect(redisConfiguration);
            }
            catch
            {
                Connection = null;
            }
        }

        public IConnectionMultiplexer? Connection { get; }
    }
}

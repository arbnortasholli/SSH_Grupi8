namespace AutoKosova.Business.Models
{
    public class ServiceResult<T>
    {
        public ServiceStatus Status { get; init; }

        public string? Error { get; init; }

        public T? Data { get; init; }

        public bool IsSuccess => Status == ServiceStatus.Success;

        public static ServiceResult<T> Success(T data)
        {
            return new ServiceResult<T>
            {
                Status = ServiceStatus.Success,
                Data = data
            };
        }

        public static ServiceResult<T> BadRequest(string error)
        {
            return Failure(ServiceStatus.BadRequest, error);
        }

        public static ServiceResult<T> Unauthorized(string error)
        {
            return Failure(ServiceStatus.Unauthorized, error);
        }

        public static ServiceResult<T> Forbidden(string error)
        {
            return Failure(ServiceStatus.Forbidden, error);
        }

        public static ServiceResult<T> NotFound(string error)
        {
            return Failure(ServiceStatus.NotFound, error);
        }

        private static ServiceResult<T> Failure(ServiceStatus status, string error)
        {
            return new ServiceResult<T>
            {
                Status = status,
                Error = error
            };
        }
    }
}

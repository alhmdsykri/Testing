namespace Func.Vehicle.MSSQL.Middleware
{
    public class GlobalException : IFunctionsWorkerMiddleware
    {
        private readonly IMediator _mediator;
        public GlobalException(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                StackTrace trace = new(ex, true);
                var frame = trace.GetFrames().Where(x => x.GetFileLineNumber() > 0).FirstOrDefault();

                LogErrorRequest request = new()
                {
                    AppName = "Vehicle Management Persistor Function App",
                    AppType = "Azure Function App",
                    ClassName = frame == null ? string.Empty : frame.GetMethod()?.DeclaringType?.FullName,
                    ClientIPAddress = string.Empty,
                    ClientURL = string.Empty,
                    ClientUserId = string.Empty,
                    ColumnNumber = frame == null ? 0 : frame.GetFileColumnNumber(),
                    CreatedAt = DateTime.Now,
                    Exception = ex.StackTrace,
                    FileName = frame == null ? string.Empty : frame.GetFileName(),
                    HTTPMethod = string.Empty,
                    HTTPRequest = string.Empty,
                    LineNumber = frame == null ? 0 : frame.GetFileLineNumber(),
                    Message = ex.Message,
                    MethodName = frame?.GetMethod()?.Name,
                    ServerURL = context.FunctionId
                };

                await _mediator.Send(request);
            }
        }
    }
}

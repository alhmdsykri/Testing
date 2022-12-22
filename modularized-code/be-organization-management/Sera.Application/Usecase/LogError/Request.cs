namespace Sera.Application.Usecase
{
    public class LogErrorRequest : IRequest<IResultStatus>
    {
        public string ClientUserId { get; set; }
        public string ClientURL { get; set; }
        public string ClientIPAddress { get; set; }
        public string ServerURL { get; set; }
        public string HTTPMethod { get; set; }
        public string HTTPRequest { get; set; }
        public string FileName { get; set; }
        public int LineNumber { get; set; }
        public int ColumnNumber { get; set; }
        public string ClassName { get; set; }
        public string MethodName { get; set; }
        public string Message { get; set; }
        public string Exception { get; set; }
        public string AppType { get; set; }
        public string AppName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewRouteResponse
    {
        public int totalRoute { get; set; }
        public int completed { get; set; }
        public int inProgress { get; set; }
        public int inComplete { get; set; }
        public int pendingApproval { get; set; }
       
    }
}
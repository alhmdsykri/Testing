namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteActivitiesResponse
    {
        public int totalActivity { get; set; }
        public int remainingActivityToComplete { get; set; }
        public List<GetListActivities> listActivity{ get; set; }

    }
    public class GetListActivities
    {
        public int routeLocationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public decimal? distanceToNextLocation { get; set; }
        public int? timeZone { get; set; }
        public int? routeActionId { get; set; }
        public string routeActionName { get; set; }
    }

}
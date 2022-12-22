namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteKMLResponse
    {        
        public string routeKML { get; set; }
        public List<LocationKML> location { get; set; }
    }

    public class LocationKML
    {
        public string name { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }
}
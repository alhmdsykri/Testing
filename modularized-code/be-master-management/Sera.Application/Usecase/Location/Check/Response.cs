namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CheckLocationResponse
    {
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public string locationTypeName { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }
}

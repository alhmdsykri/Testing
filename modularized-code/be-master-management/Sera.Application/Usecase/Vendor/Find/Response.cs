namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVendorResponse
    {
        public int vendorId { get; set; }
        public string vendorCode { get; set; }
        public string vendorName { get; set; }
        public DateTime ? modifiedAt { get; set; }
    }
}
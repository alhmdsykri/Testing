namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateVendorContractRequest : IRequest<Response>
    {
        public int vendorContractId { get; set; }
        public string contractNumber { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}

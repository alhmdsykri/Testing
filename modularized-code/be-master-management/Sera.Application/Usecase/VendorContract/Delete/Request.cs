namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteVendorContractRequest : IRequest<Response>
    {
        public int vendorContractId { get; set; }
    }
}

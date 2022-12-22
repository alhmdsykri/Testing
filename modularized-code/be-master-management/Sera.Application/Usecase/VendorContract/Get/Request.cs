namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorContractRequest : IRequest<Response<IEnumerable<GetVendorContractResponse>>>
    {
        public int vendorId { get; set; }
    }
}
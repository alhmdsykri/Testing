namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorContractDetailRequest : IRequest<Response<GetVendorContractDetailResponse>>
    {
        public int vendorContractId { get; set; }
    }
}
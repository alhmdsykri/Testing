namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorRequest : IRequest<Response<GetVendorResponse>>
    {
        public int vendorId { get; set; }
    }
}
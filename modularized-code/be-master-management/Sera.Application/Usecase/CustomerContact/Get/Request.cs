namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerContactDetailsRequest : IRequest<Response<GetCustomerContactDetailsResponse>>
    {
        public int customerContactId { get; set; }
    }
}
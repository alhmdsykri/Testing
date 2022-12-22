namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerRequest : IRequest<Response<GetCustomerResponse>>
    {
        public int customerId { get; set; }
    }
}
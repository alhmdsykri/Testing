namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerContactListRequest : IRequest<Response<IEnumerable<GetCustomerContactListResponse>>>
    {
        public int customerId { get; set; }
    }
}
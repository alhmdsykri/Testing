namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]

    public class GetContractItemRequest : IRequest<Response<GetContractItemResponse>>
    {
        public int contractId { get; set; }
        public int contractItemId { get; set; }
    }
}
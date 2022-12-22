namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]

    public class GetContractRequest : IRequest<Response<GetContractResponse>>
    {
        public int contractId { get; set; }
    }
}
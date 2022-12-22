namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]

    public class GetOverviewContractRequest : IRequest<Response<GetOverviewContractResponse>>
    {
        public int businessUnitId { get; set; }
    }
}
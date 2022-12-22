namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBranchRequest : IRequest<Response<GetBranchResponse>>
    {
        public int branchId { get; set; }
    }
}

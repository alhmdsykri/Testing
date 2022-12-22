namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRegionRequest : IRequest<Response<GetRegionResponse>>
    {
        public int regionId { get; set; }
    }
}

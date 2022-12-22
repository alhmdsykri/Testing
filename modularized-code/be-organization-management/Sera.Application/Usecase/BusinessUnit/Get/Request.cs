namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBURequest : IRequest<Response<GetBUResponse>>
    {
        public short businessUnitId { get; set; }
    }
}

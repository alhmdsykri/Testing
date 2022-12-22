namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetValidLocationRequest : IRequest<Response<GetValidLocationResponse>>
    {
        public int locationId { get; set; }
    }
}
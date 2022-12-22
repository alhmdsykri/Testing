namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetLocationRequest : IRequest<Response<GetLocationResponse>>
    {
        public int locationId { get; set; }
    }
}
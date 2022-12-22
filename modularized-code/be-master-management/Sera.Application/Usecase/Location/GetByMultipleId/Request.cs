namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetLocationByMultipleIdRequest : IRequest<Response<GetLocationByMultipleIdResponse>>
    {
        public int[] locationId { get; set; }
    }
}

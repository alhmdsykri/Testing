namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class LocationReadyForModificationRequest : IRequest<Response<LocationReadyForModificationResponse>>
    {
        public int locationId { get; set; }
    }
}
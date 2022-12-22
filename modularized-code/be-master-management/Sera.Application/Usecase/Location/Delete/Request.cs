namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteLocationRequest : IRequest<Response>
    {
        public int locationId { get; set; }
    }
}
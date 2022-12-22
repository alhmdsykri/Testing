namespace Sera.Application.Usecase
{
    public class CheckLocationHandler : BaseHandler,
        IRequestHandler<CheckLocationRequest, Response<IEnumerable<CheckLocationResponse>>>
    {
        public CheckLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<CheckLocationResponse>>> Handle(
            CheckLocationRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<CheckLocationResponse>>();
            IQueryable<SQL.Location> query = null;

            query = dbContext.Location
                             .AsNoTracking()
                             .Include(x => x.locationType)
                             .Where(x => DRBAC.locations.Contains(x.locationId) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (!request.locationId.IsEmpty())
            {
                query = query.AsNoTracking()
                             .Where(x => request.locationId.Contains(x.locationId));
            }

            if (!request.locationTypeCode.IsEmpty())
            {
                query = query.AsNoTracking()
                             .Where(x => x.locationType.locationTypeCode == request.locationTypeCode);
            }

            var data = await query.Select(x => new CheckLocationResponse()
            {
                locationId = x.locationId,
                latitude = x.latitude,
                longitude = x.longitude,
                locationCode = x.locationCode,
                locationName = x.locationName,
                locationTypeName = x.locationType.locationTypeName
            }).ToListAsync(cancellationToken);

            if (data.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Location"),
                                     1, data.Count, data.Count, new List<CheckLocationResponse>());
            }

            return response.Success(TransactionId, Message.Found("Location"),
                                    1, data.Count, data.Count, data);
        }
    }
}

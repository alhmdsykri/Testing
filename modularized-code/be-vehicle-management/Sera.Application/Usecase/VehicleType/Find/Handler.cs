namespace Sera.Application.Usecase
{
    public class FindVehicleTypeHandler : BaseHandler,
        IRequestHandler<FindVehicleTypeRequest, Response<IEnumerable<FindVehicleTypeResponse>>>
    {
        public FindVehicleTypeHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindVehicleTypeResponse>>> Handle(
            FindVehicleTypeRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindVehicleTypeResponse>>();

            IQueryable<SQL.VehicleType>? query = null;

            if (request.vehicleTypeSearchBy == SearchVehicleTypeBy.vehicleTypeCode)
            {
                query = dbContext.VehicleType
                                 .AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.vehicleTypeCode,
                                                               $"%{request.vehicleTypeSearch}%"));
            }
            else
            {
                query = dbContext.VehicleType
                                 .AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.vehicleTypeName,
                                                               $"%{request.vehicleTypeSearch}%"));
            }

            var entity = await query.Select(s => new FindVehicleTypeResponse()
            {
                vehicleTypeId = s.vehicleTypeId,
                vehicleTypeCode = s.vehicleTypeCode,
                vehicleTypeName = s.vehicleTypeName,
                driverLicenseTypeName = s.driverLicenseTypeName,
                modifiedAt = s.modifiedAt
            }).Distinct().ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle Type"),
                                     request.page, request.row, 0, new List<FindVehicleTypeResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY VEHICLE TYPE NAME)
            entity = entity.OrderByDescending(x => x.modifiedAt).ToList();

            if (request.vehicleTypeSearchBy == SearchVehicleTypeBy.vehicleTypeCode)
            {
                entity = entity.OrderByDescending(x => x.modifiedAt).ToList();
            }

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Vehicle Type"),
                                    request.page, request.row, total, entity);
        }
    }
}
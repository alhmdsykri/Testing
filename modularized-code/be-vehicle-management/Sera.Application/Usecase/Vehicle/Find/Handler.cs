namespace Sera.Application.Usecase
{
    public class FindVehicleHandler : BaseHandler,
        IRequestHandler<FindVehicleRequest, Response<IEnumerable<FindVehicleResponse>>>
    {
        public FindVehicleHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindVehicleResponse>>> Handle(
            FindVehicleRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindVehicleResponse>>();
            int total;
            IQueryable<SQL.Vehicle>? query;

            query = dbContext.Vehicle
                             .AsNoTracking()
                             .Where(x => DRBAC.locations.Contains(x.locationId) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (request.vehicleTypeId.HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.vehicleTypeId == request.vehicleTypeId);
            }

            if (!string.IsNullOrWhiteSpace(request.licensePlate))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.licensePlate, $"%{request.licensePlate}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.branchCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.branchCode, $"%{request.branchCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.branchName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.branchName, $"%{request.branchName}%"));
            }

            if (request.locationId.HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.locationId == request.locationId);
            }

            if (!string.IsNullOrWhiteSpace(request.locationCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationCode, $"%{request.locationCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.locationName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationName, $"%{request.locationName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.currentLocationCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.currentLocationCode, $"%{request.currentLocationCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.currentLocationName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.currentLocationName, $"%{request.currentLocationName}%"));
            }

            if (request.vehicleStatus.HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.vehicleStatus == request.vehicleStatus);
            }

            if (request.lastUpdate.HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.modifiedAt.Date == request.lastUpdate.Value.Date);
            }

            var entity = await query.Select(s => new FindVehicleResponse()
            {
                licensePlate = s.licensePlate,
                branchCode = s.branchCode,
                branchName = s.branchName,
                source = s.source,
                locationId = s.locationId,
                locationCode = s.locationCode,
                locationName = s.locationName,
                currentLocationCode = s.currentLocationCode,
                currentLocationName = s.currentLocationName,
                vehicleStatus = s.vehicleStatus == 1 ? "Free" :
                                s.vehicleStatus == 2 ? "On Contract" :
                                s.vehicleStatus == 3 ? "On Duty" :
                                s.vehicleStatus == 4 ? "Breakdown" :
                                s.vehicleStatus == 5 ? "Unavailable" : "Missing",
                vehicleId = s.vehicleId,
                lastUpdate = s.modifiedAt
            }).ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle"),
                                     request.page, request.row, 0, new List<FindVehicleResponse>());
            }

            //DEFAULT ORDER AND SORT (DESCENDING BY LAST UPDATE)
            entity = entity.OrderByDescending(x => x.lastUpdate).ToList();

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVehicle.LocationName)
            {
                entity = entity.OrderBy(x => x.locationName).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortVehicle.LocationName)
            {
                entity = entity.OrderByDescending(x => x.locationName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVehicle.currentLocationName)
            {
                entity = entity.OrderBy(x => x.currentLocationName).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortVehicle.currentLocationName)
            {
                entity = entity.OrderByDescending(x => x.currentLocationName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVehicle.VehicleStatus)
            {
                entity = entity.OrderBy(x => x.vehicleStatus).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortVehicle.VehicleStatus)
            {
                entity = entity.OrderByDescending(x => x.vehicleStatus).ToList();
            }

            total = entity.Count;
            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Vehicle"),
                                    request.page, request.row, total, entity);
        }
    }
}

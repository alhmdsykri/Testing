namespace Sera.Application.Usecase
{
    public class GetVehicleReferenceHandler : BaseHandler,
                 IRequestHandler<GetVehicleReferenceRequest, Response<IEnumerable<GetVehicleReferenceResponse>>>
    {
        public GetVehicleReferenceHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
        : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetVehicleReferenceResponse>>> Handle(
            GetVehicleReferenceRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetVehicleReferenceResponse>>();

            List<GetVehicleReferenceResponse> entity = new();

            #region GET VEHICLE BRAND
            if (request.referenceName == VehicleReferenceType.BRAND)
            {
                IQueryable<SQL.VehicleBrand> query;

                query = dbContext.VehicleBrand
                                 .AsNoTracking()
                                 .Where(x => x.status == (int)EventStatus.COMPLETED)
                                 .OrderBy(x => x.vehicleBrandName);

                entity.AddRange(await query.Select(s => new GetVehicleReferenceResponse()
                {
                    brandId = s.vehicleBrandId,
                    brandCode = s.vehicleBrandCode,
                    brandName = s.vehicleBrandName
                }).ToListAsync(cancellationToken));

                if (entity.IsEmpty())
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Brand"),
                                         new List<GetVehicleReferenceResponse>());
                }
            }
            #endregion

            #region GET VEHICLE CATEGORY
            if (request.referenceName == VehicleReferenceType.CATEGORY)
            {
                IQueryable<SQL.VehicleCategory> query;

                query = dbContext.VehicleCategory
                                 .AsNoTracking()
                                 .Where(x => x.status == (int)EventStatus.COMPLETED)
                                 .OrderBy(x => x.vehicleCategoryName);

                entity.AddRange(await query.Select(s => new GetVehicleReferenceResponse()
                {
                    categoryId = s.vehicleCategoryId,
                    categoryCode = s.vehicleCategoryCode,
                    categoryName = s.vehicleCategoryName
                }).ToListAsync(cancellationToken));

                if (entity.IsEmpty())
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Category"),
                                         new List<GetVehicleReferenceResponse>());
                }

                return response.Success(TransactionId, Message.Found("Vehicle Category"), entity);
            }
            #endregion

            #region GET VEHICLE MODEL
            if (request.referenceName == VehicleReferenceType.MODEL)
            {
                IQueryable<SQL.VehicleModel> query;

                query = dbContext.VehicleModel
                                 .AsNoTracking()
                                 .Where(x => x.status == (int)EventStatus.COMPLETED)
                                 .OrderBy(x => x.vehicleModelName);

                entity.AddRange(await query.Select(s => new GetVehicleReferenceResponse()
                {
                    modelId = s.vehicleModelId,
                    modelCode = s.vehicleModelCode,
                    modelName = s.vehicleModelName
                }).ToListAsync(cancellationToken));

                if (entity.IsEmpty())
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Model"),
                                         new List<GetVehicleReferenceResponse>());
                }

                return response.Success(TransactionId, Message.Found("Vehicle Model"), entity);
            }
            #endregion

            #region GET VEHICLE COLOR
            if (request.referenceName == VehicleReferenceType.COLOR)
            {
                IQueryable<SQL.VehicleColor> query;

                query = dbContext.VehicleColor
                                 .AsNoTracking()
                                 .Where(x => x.status == (int)EventStatus.COMPLETED)
                                 .OrderBy(x => x.vehicleColorName);

                entity.AddRange(await query.Select(s => new GetVehicleReferenceResponse()
                {
                    colorId = s.vehicleColorId,
                    colorCode = s.vehicleColorCode,
                    colorName = s.vehicleColorName
                }).ToListAsync(cancellationToken));

                if (entity.IsEmpty())
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Color"),
                                         new List<GetVehicleReferenceResponse>());
                }

                return response.Success(TransactionId, Message.Found("Vehicle Color"), entity);
            }
            #endregion

            #region GET VEHICLE FUELTYPE
            if (request.referenceName == VehicleReferenceType.FUELTYPE)
            {
                IQueryable<SQL.FuelType> query;

                query = dbContext.FuelType
                                 .AsNoTracking()
                                 .Where(x => x.status == (int)EventStatus.COMPLETED)
                                 .OrderBy(x => x.fuelTypeName);

                entity.AddRange(await query.Select(s => new GetVehicleReferenceResponse()
                {
                    fuelTypeId = s.fuelTypeId,
                    fuelTypeCode = s.fuelTypeCode,
                    fuelTypeName = s.fuelTypeName
                }).ToListAsync(cancellationToken));

                if (entity.IsEmpty())
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Fuel Type"),
                                         new List<GetVehicleReferenceResponse>());
                }

                return response.Success(TransactionId, Message.Found("Vehicle Fuel Type"), entity);
            }
            #endregion

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.InvalidReferenceName(),
                                     new List<GetVehicleReferenceResponse>());
            }

            return response.Success(TransactionId, Message.Found("Vehicle Reference"), entity);
        }
    }
}

using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class SearchByMaterialHelper
    {
        private readonly IConfiguration configuration;
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly ILogger<SearchByMaterialHelper> logger;

        public SearchByMaterialHelper(IConfiguration configuration,
                                      DbHandlerHyperLabData dbHandlerHyperLabData,
                                      ILogger<SearchByMaterialHelper> logger)
        {
            this.configuration = configuration;
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.logger = logger;
        }

        public List<SpectraGroupInfoModel>? searchByMaterial(int id,
                                                             string type,
                                                             int[] requestedLevels,
                                                             int operationUserId)
        {
            List<SpectraGroupInfoModel>? spectraGroupInfoModels = null;

            MaterialType mineralType = type.ToMaterialType();

            switch (mineralType)
            {
                case MaterialType.MeteorClass:
                    spectraGroupInfoModels = dbHandlerHyperLabData.searchSimpleGroupsByMeteoriteClass(id,
                                                                                                      requestedLevels,
                                                                                                      operationUserId);

                    break;

                case MaterialType.Mineral:
                    spectraGroupInfoModels = dbHandlerHyperLabData.searchSimpleGroupsByMineral(id,
                                                                                               requestedLevels,
                                                                                               operationUserId);
                    break;

                case MaterialType.Rock:
                    spectraGroupInfoModels = dbHandlerHyperLabData.searchSimpleGroupsByRock(id,
                                                                                            requestedLevels,
                                                                                            operationUserId);
                    break;
            }

            return spectraGroupInfoModels;
        }
    }
}

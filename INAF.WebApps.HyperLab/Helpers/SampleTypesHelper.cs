using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabData.Models.DbValues;
using INAF.Libraries.Net.HyperLabCommonModels.Extensions;
using INAF.Libraries.Net.HyperLabCommonModels.Models.SampleData;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class SampleTypesHelper
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SampleTypesHelper(DbHandlerHyperLabData dbHandlerSLabData)
        {
            this.dbHandlerHyperLabData = dbHandlerSLabData;
        }

        public SampleDataAvailableValues getSampleTypeValuesContainer()
        {
            IEnumerable<DbStringValue> sampleTypeValues = dbHandlerHyperLabData.getSampleTypeValues();

            List<DbIntDoubleValue> sampleTypeGrainSizeValues = dbHandlerHyperLabData.getSampleTypeGrainSizeValues();

            List<DbStringValue> sampleTypeGrainSizeTypeValues = dbHandlerHyperLabData.getSampleTypeGrainSizeTypeValues();

            List<DbStringValue> originTypeValues = dbHandlerHyperLabData.getOriginTypeValues();

            List<MineralTypeModel> mineralTypeValues = dbHandlerHyperLabData.getMineralTypeValues();

            List<SampleTypeModel> sampleDataValues = new List<SampleTypeModel>(sampleTypeValues.Count());
            foreach (var sampleTypeValue in sampleTypeValues)
            {
                var sampleDataValue = new SampleTypeModel()
                {
                    Id = sampleTypeValue.Id,
                    Value = sampleTypeValue.StringValue,
                    GrainSizeValues = sampleTypeGrainSizeValues
                                        .Where(x => x.RefId == sampleTypeValue.Id)
                                        .Select(x => new GrainSizeModel() { Id = x.Id, Value = x.DoubleValue })
                                        .ToList()
                };
                sampleDataValues.Add(sampleDataValue);
            }

            return new SampleDataAvailableValues()
            {
                SampleDataValues = sampleDataValues,

                GrainSizeTypeValues = sampleTypeGrainSizeTypeValues
                                        .Select(x => new GrainSizeTypeModel() { Id = x.Id, Type = x.StringValue, TypeValue = x.StringValue.ToGrainSizeType() })
                                        .ToList(),

                OriginTypeValues = originTypeValues
                                    .Select(x => new OriginTypeModel() { Id = x.Id, Value = x.StringValue })
                                    .ToList(),

                MineralTypeValues = mineralTypeValues
            };
        }
    }
}

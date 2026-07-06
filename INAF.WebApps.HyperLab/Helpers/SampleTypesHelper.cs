using INAF.Libraries.Net.CommonWebAppModels.Models.DbValues;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using INAF.WebApps.HyperLab.Extensions;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class SampleTypesHelper
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SampleTypesHelper(DbHandlerHyperLabData dbHandlerHyperLabData)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        public SampleDataAvailableValues getSampleTypeValuesContainer()
        {
            IEnumerable<DbStringValue>? sampleTypeValues = dbHandlerHyperLabData.getSampleTypeValues();
            if (!sampleTypeValues.IsAny())
                return SampleDataAvailableValues.CreateEmpty();

            List<DbIntDoubleValue>? sampleTypeGrainSizeValues = dbHandlerHyperLabData.getSampleTypeGrainSizeValues();
            if (!sampleTypeGrainSizeValues.IsAny())
                return SampleDataAvailableValues.CreateEmpty();

            List<DbStringValue>? sampleTypeGrainSizeTypeValues = dbHandlerHyperLabData.getSampleTypeGrainSizeTypeValues();
            if (!sampleTypeGrainSizeTypeValues.IsAny())
                return SampleDataAvailableValues.CreateEmpty();

            List<DbStringValue>? originTypeValues = dbHandlerHyperLabData.getOriginTypeValues();
            if (!originTypeValues.IsAny())
                return SampleDataAvailableValues.CreateEmpty();
            originTypeValues!.Insert(0, DbStringValue.CreateEmpty());

            List<MineralTypeModel>? mineralTypeValues = dbHandlerHyperLabData.getMineralTypeValues();
            if (!mineralTypeValues.IsAny())
                return SampleDataAvailableValues.CreateEmpty();
            mineralTypeValues!.Insert(0, MineralTypeModel.CreateEmpty());

            List<SampleTypeModel> sampleDataValues = new List<SampleTypeModel>();
            foreach (var sampleTypeValue in sampleTypeValues!)
            {
                var sampleDataValue = new SampleTypeModel()
                {
                    Id = sampleTypeValue.Id,
                    Value = sampleTypeValue.StringValue,
                    GrainSizeValues = sampleTypeGrainSizeValues!
                                        .Where(x => x.RefId == sampleTypeValue.Id)
                                        .Select(x => x.ToGrainSizeModel())
                                        .ToList()
                };
                sampleDataValues.Add(sampleDataValue);
            }
            sampleDataValues.Insert(0, SampleTypeModel.CreateEmpty());

            return new SampleDataAvailableValues()
            {
                SampleDataValues = sampleDataValues,

                GrainSizeTypeValues = sampleTypeGrainSizeTypeValues!
                                        .Select(x => x.ToGrainSizeTypeModel())
                                        .ToList(),

                OriginTypeValues = originTypeValues
                                    .Select(x => x.ToOriginTypeModel())
                                    .ToList(),

                MineralTypeValues = mineralTypeValues
            };
        }
    }
}

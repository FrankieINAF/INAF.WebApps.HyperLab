using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.DB.SLabData;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Spectrum;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Values;
using INAF.WebApps.HyperLab.Extensions;
using System.Dynamic;
using static INAF.Libraries.NetStandard.HyperLabCommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class ChartsHelper
    {
        private readonly DbHandlerSLabData dbHandlerSLabData;

        public ChartsHelper(DbHandlerSLabData dbHandlerSLabData)
        {
            this.dbHandlerSLabData = dbHandlerSLabData;
        }

        public ExpandoObject createMultipleSpectraJson(List<int> ids,
                                                       int operationUserId)
        {
            //string json = string.Empty;

            int idsNum = ids.Count;

            List<ISpectrumModel> spectraModels = dbHandlerSLabData.getSpectraByIdProcedure(ids,
                                                                                    operationUserId);

            /* extract min,max for all series and then retrieve absolute min,max */
            (double min, double max) seriesBoundaries = getSeriesBoundaries(spectraModels);

            /* retrieve x values from 1st spectrum */
            List<double> xValues = spectraModels.First().Points.Select(x => x.X).ToList();

            ExpandoObject resultObject = new ExpandoObject();
            resultObject.AddProperty(nameof(AxisRange), new AxisRange(Enums.Axis.Y, seriesBoundaries.min, seriesBoundaries.max));
            resultObject.AddProperty("SpectraInfo", spectraModels.Select(x => SpectrumInfoModel.Create(x)).ToList());

            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var xValue in xValues)
            {
                ExpandoObject Value = new ExpandoObject();
                Value.AddProperty("X", xValue);
                var infos = spectraModels.Select(x => new { x.Id, x.Points.First(y => y.X == xValue).Y }).ToList();
                for (int i = 0; i < idsNum; i++)
                {
                    Value.AddProperty($"id{infos[i].Id}", infos[i].Y);
                }
                Values.Add(Value);
            }
            resultObject.AddProperty("Points", Values);

            return resultObject;
        }

        public ExpandoObject? createSingleSpectrumJson(int parentId,
                                                      SpectrumType spectrumType,
                                                      int operationUserId)
        {
            ISpectrumModel spectrumModel = dbHandlerSLabData.getSpectrumByParentIdAndSpectrumType(parentId,
                                                                                          spectrumType, 
                                                                                          operationUserId);

            if (spectrumModel == null)
                return null;

            /* extract min,max for all series and then retrieve absolute min,max */
            (double min, double max) seriesBoundaries = getSeriesBoundaries(new List<ISpectrumModel> { spectrumModel });

            /* retrieve x values from 1st spectrum */
            List<double> xValues = spectrumModel.Points.Select(x => x.X).ToList();

            ExpandoObject resultObject = new ExpandoObject();
            resultObject.AddProperty(nameof(AxisRange), new AxisRange(Enums.Axis.Y, seriesBoundaries.min, seriesBoundaries.max));
            resultObject.AddProperty("SpectraInfo", SpectrumInfoModel.Create(spectrumModel));

            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var xValue in xValues)
            {
                ExpandoObject Value = new ExpandoObject();
                Value.AddProperty("X", xValue);
                var infos = new { spectrumModel.Id, spectrumModel.Points.First(y => y.X == xValue).Y };
                Value.AddProperty($"id{infos.Id}", infos.Y);
                Values.Add(Value);
            }
            resultObject.AddProperty("Points", Values);

            return resultObject;
        }

        public ExpandoObject createRefWhitesJson(List<int> ids,
                                                 int operationUserId)
        {
            //string json = string.Empty;

            int idsNum = ids.Count;

            List<ISpectrumModel> spectraModels = dbHandlerSLabData.getSpectraByIdProcedure(ids,
                                                                                   operationUserId);

            /* extract min,max for all series and then retrieve absolute min,max */
            (double min, double max) seriesBoundaries = getSeriesBoundaries(spectraModels);

            /* retrieve x values from 1st spectrum */
            List<double> xValues = spectraModels.First().Points.Select(x => x.X).ToList();

            ExpandoObject resultObject = new ExpandoObject();
            resultObject.AddProperty(nameof(AxisRange), new AxisRange(Enums.Axis.Y, seriesBoundaries.min, seriesBoundaries.max));
            resultObject.AddProperty("SpectraInfo", spectraModels.Select(x => SpectrumInfoModel.Create(x)).ToList());

            List<ExpandoObject> Values = new List<ExpandoObject>();
            foreach (var spectrumModel in spectraModels)
            {
                var id = spectrumModel.Id;
                foreach (var point in spectrumModel.Points)
                {
                    ExpandoObject Value = new ExpandoObject();
                    Value.AddProperty("X", point.X);
                    Value.AddProperty($"id{id}", point.Y);
                    Values.Add(Value);
                }
            }

            Values = Values.OrderBy(x => ((IDictionary<string, object>)x)["X"]).ToList();

            resultObject.AddProperty("Points", Values);

            return resultObject;
        }

        private (double min, double max) getSeriesBoundaries(List<ISpectrumModel> spectraModels)
        {
            /* extract min,max for all series and then retrieve absolute min,max */
            List<AxisRange> axisRanges = new List<AxisRange>(spectraModels.Count);
            foreach (var spectrumModel in spectraModels)
            {
                var min = spectrumModel.Points.Min(x => x.Y);
                var max = spectrumModel.Points.Max(x => x.Y);
                axisRanges.Add(new AxisRange(Enums.Axis.Y, min, max));
            }
            double seriesMin = axisRanges.Min(x => x.Min);
            double seriesMax = axisRanges.Max(x => x.Max);

            return (seriesMin, seriesMax);
        }
    }
}

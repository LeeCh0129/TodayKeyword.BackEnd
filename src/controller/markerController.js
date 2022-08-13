import Marker from "../models/Marker.js";

export const getMarker = async (req, res) => {
  //   const newMarker = await Marker.create({
  //     position: {
  //       lat: 37.270952,
  //       lng: 127.1264088,
  //     },
  //     store: "더진국수육국밥 강남대점",
  //     address: "경기 용인시 기흥구 강남로 3 강남앤플러스",
  //     category: "맛집",
  //   });
  const marker = await Marker.find({});

  res.json(marker);
};

export const postCreateMarker = (req, res) => {
  console.log(req.body);
  res.json({});
};

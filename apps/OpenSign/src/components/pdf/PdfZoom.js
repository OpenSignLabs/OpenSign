import React from "react";

function PdfZoom(props) {
  const onClickZoomIn = () => {
    props.setScale(props.scale + 0.1 * props.scale);
    props.setZoomPercent(props.zoomPercent + 10);
  };
  const onClickZoomOut = () => {
    if (props.zoomPercent > 0) {
      if (props.zoomPercent === 10) {
        props.setScale(1);
      } else {
        props.setScale(props.scale - 0.1 * props.scale);
      }
      props.setZoomPercent(props.zoomPercent - 10);
    }
  };
  const handleReset = () => {
    props.setScale(1);
    props.setZoomPercent(0);
  };
  return (
    // md:mt-[41px] xl:mt-[63px]mt=[]
    <span className=" hidden  md:flex flex-col gap-1 text-center md:w-[5%] mt-[50px] 2xl:mt-[63px]">
      <span
        className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px] cursor-pointer"
        onClick={onClickZoomIn}
        title="Zoom in"
      >
        <i className="fa-solid fa-magnifying-glass-plus text-gray-500 2xl:text-[30px]"></i>
      </span>
      <span
        className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px] cursor-pointer "
        onClick={handleReset}
        title="Reset"
      >
        <i className="fa-solid fa-arrows-rotate text-gray-500  2xl:text-[30px]"></i>
      </span>
      <span
        className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px]"
        onClick={onClickZoomOut}
        style={{
          cursor: props.zoomPercent > 0 ? "pointer" : "default"
        }}
        title="Zoom out"
      >
        <i className="fa-solid fa-magnifying-glass-minus text-gray-500 2xl:text-[30px]"></i>
      </span>
    </span>
  );
}

export default PdfZoom;

#include "hlk_api.h"
#include "llk_defs.h"

constexpr bool IS_FP32_DEST_ACC_EN = 0;
constexpr bool IS_PERF_DUMP_EN = 1;
constexpr bool IS_UNTILIZE_OUTPUT_EN = 0;
constexpr bool IS_PACK_MICROBLOCKS_EN = 1;
constexpr bool IS_PACK_L1_ACC_EN = 0;
constexpr bool IS_UNPACK_MATH_DECOUPLED_EN = 0;
constexpr bool IS_MATH_PACK_DECOUPLED_EN = 0;
constexpr bool IS_INT_FPU_EN = 0;
constexpr bool IS_TILE_DIM_UNPACK_RECONFIG_EN = 0;
constexpr bool IS_TILE_DIM_PACK_RECONFIG_EN = 0;
constexpr ReluType RELU_TYPE = ReluType::NO_RELU;
constexpr uint32_t RELU_THRESHOLD = 0;
constexpr SfpuExecutionThread SFPU_EXECUTION_THREAD = SfpuExecutionThread::Math;
constexpr StochRndType STOCH_RND_TYPE = StochRndType::None;
constexpr bool IS_KERNEL_UNPACK_DELAY_EN = 0;
constexpr bool IS_KERNEL_MATH_DELAY_EN = 0;
constexpr bool IS_KERNEL_PACK_DELAY_EN = 0;
constexpr DstTileFaceLayout MATMUL_AND_KERNEL_SETUP_DST_FACE_LAYOUT = DstTileFaceLayout::RowMajor;
constexpr DstSync DST_SYNC = DstSync::SyncHalf;

constexpr BinaryOp BINARY_KERNEL_TYPE = BinaryOp::Multiply;
// We define BINARY_KERNEL_TYPE_DEFINED so we don't use BINARY_KERNEL_TYPE from eltwise_binary.h
#define BINARY_KERNEL_TYPE_DEFINED

const hlk_args_t hlk_args = {
.block_tile_dim = 1,
.dst_tile_rows = 0,
.dst_tile_cols = 0,
.block_cnt = 1,
.batch_cnt = 4,
.in0_block_tile_cnt = 0,
.in1_block_tile_cnt = 0,
.out_block_tile_cnt = 0,
.num_m_sub_blocks = 1,
.num_n_sub_blocks = 1,
.num_tiles_per_m_sub_block = 1,
.num_tiles_per_n_sub_block = 4,
.num_tiles_per_sub_block = 0,
.gradient_op = 0,
.transpose = 0,
.bias = 0,
.accumulate = 0,
.z = 0,
.relu_config = 0,
.min_input_buffer = 
{
0,
0,
},
.sfpu_op = 22,
.sfpu_vector_mode = 4,
.l1_acc_en = 0,
.shared_buffer = 1,
.adv_features_en = 1,
};

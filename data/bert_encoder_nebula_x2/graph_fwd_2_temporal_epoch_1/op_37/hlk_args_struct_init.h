const hlk_args_t hlk_args = {
.block_tile_dim = 8,
.block_cnt = 2,
.batch_cnt = 1,
.num_m_sub_blocks = 1,
.num_n_sub_blocks = 2,
.num_tiles_per_m_sub_block = 4,
.num_tiles_per_n_sub_block = 2,
.gradient_op = 0,
.transpose = 0,
.zero_point = 0,
.is_32bit_dest_en = 0,
};

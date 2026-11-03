"""add harvest records table

Revision ID: f5b6c7d8e9f0
Revises: e4a5b6c7d8e9
Create Date: 2026-11-03 22:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5b6c7d8e9f0'
down_revision: Union[str, None] = 'e4a5b6c7d8e9'
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create harvest_records table
    op.create_table(
        'harvest_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('farmer_id', sa.Integer(), nullable=False),
        sa.Column('commodity', sa.String(length=100), nullable=False),
        sa.Column('variety', sa.String(length=100), nullable=False),
        sa.Column('harvest_date', sa.Date(), nullable=False),
        sa.Column('harvested_quantity', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('remaining_quantity', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('quantity_unit', sa.String(length=20), nullable=False),
        sa.Column('quality_grade', sa.String(length=50), nullable=True),
        sa.Column('storage_location', sa.String(length=150), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['farmer_id'], ['farmer_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_harvest_records_id'), 'harvest_records', ['id'], unique=False)
    op.create_index(op.f('ix_harvest_records_farmer_id'), 'harvest_records', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_harvest_records_commodity'), 'harvest_records', ['commodity'], unique=False)

    # 2. Add harvest_id to selling_lots
    with op.batch_alter_table('selling_lots', schema=None) as batch_op:
        batch_op.add_column(sa.Column('harvest_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_selling_lots_harvest_id', 'harvest_records', ['harvest_id'], ['id'], ondelete='SET NULL')
        batch_op.create_index(batch_op.f('ix_selling_lots_harvest_id'), ['harvest_id'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('selling_lots', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_selling_lots_harvest_id'))
        batch_op.drop_constraint('fk_selling_lots_harvest_id', type_='foreignkey')
        batch_op.drop_column('harvest_id')

    op.drop_index(op.f('ix_harvest_records_commodity'), table_name='harvest_records')
    op.drop_index(op.f('ix_harvest_records_farmer_id'), table_name='harvest_records')
    op.drop_index(op.f('ix_harvest_records_id'), table_name='harvest_records')
    op.drop_table('harvest_records')


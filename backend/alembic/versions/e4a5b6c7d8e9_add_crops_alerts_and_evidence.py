"""add crops alerts and evidence

Revision ID: e4a5b6c7d8e9
Revises: ddebf86cd4ab
Create Date: 2026-11-03 21:56:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e4a5b6c7d8e9'
down_revision: Union[str, None] = 'ddebf86cd4ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Update farmer_profiles with commonly_grown_crops and frequently_sold_commodities
    with op.batch_alter_table('farmer_profiles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('commonly_grown_crops', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('frequently_sold_commodities', sa.JSON(), nullable=True))

    # 2. Update sales with evidence and audio_note
    with op.batch_alter_table('sales', schema=None) as batch_op:
        batch_op.add_column(sa.Column('evidence_url', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('evidence_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('audio_note_url', sa.String(length=500), nullable=True))

    # 3. Update payments with evidence and audio_note
    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.add_column(sa.Column('evidence_url', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('evidence_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('audio_note_url', sa.String(length=500), nullable=True))

    # 4. Create price_alerts table
    op.create_table(
        'price_alerts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('farmer_id', sa.Integer(), nullable=False),
        sa.Column('commodity', sa.String(length=100), nullable=False),
        sa.Column('market_name', sa.String(length=150), nullable=True),
        sa.Column('target_modal_price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('condition', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_price_alerts_id'), 'price_alerts', ['id'], unique=False)
    op.create_index(op.f('ix_price_alerts_farmer_id'), 'price_alerts', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_price_alerts_commodity'), 'price_alerts', ['commodity'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_price_alerts_commodity'), table_name='price_alerts')
    op.drop_index(op.f('ix_price_alerts_farmer_id'), table_name='price_alerts')
    op.drop_index(op.f('ix_price_alerts_id'), table_name='price_alerts')
    op.drop_table('price_alerts')

    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.drop_column('audio_note_url')
        batch_op.drop_column('evidence_type')
        batch_op.drop_column('evidence_url')

    with op.batch_alter_table('sales', schema=None) as batch_op:
        batch_op.drop_column('audio_note_url')
        batch_op.drop_column('evidence_type')
        batch_op.drop_column('evidence_url')

    with op.batch_alter_table('farmer_profiles', schema=None) as batch_op:
        batch_op.drop_column('frequently_sold_commodities')
        batch_op.drop_column('commonly_grown_crops')

